import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";
import OutCall "lib/outcall";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Error "mo:core/Error";
import Text "mo:core/Text";
import Map "mo:core/Map";

actor {
  type PoseCriteria = {
    bodyType : Text;
    age : Nat;
    ethnicity : Text;
    artStyle : Text;
    height : Float;
    weight : Float;
    negativePrompt : Text;
    aspectRatio : Text;
    cameraLens : Text;
    clothing : Text;
    situationPose : Text;
    situationFiguration : Text;
    situationBehavior : Text;
    situationPosing : Text;
    cameraAngle : Text;
    lighting : Text;
    environment : Text;
    composition : Text;
  };

  type Preset = {
    name : Text;
    criteria : PoseCriteria;
  };

  type PromptHistory = {
    prompt : Text;
    timestamp : Time.Time;
    criteria : PoseCriteria;
  };

  type GenerateImageArgs = {
    negativePrompt : Text;
    positivePrompt : Text;
    aspectRatio : Text;
    seed : Int;
    temperature : Float;
    model : Text;
  };

  type GenerateImageResult = {
    #ok : Text;
    #err : Text;
  };

  let poseCriteriaSet = Set.empty<Text>();
  let presetsList = List.empty<Preset>();
  let promptHistoryList = List.empty<PromptHistory>();
  let environmentVariables = Map.empty<Text, Text>();

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Escape a text value for safe inclusion inside a JSON string
  func jsonEscape(t : Text) : Text {
    var result = "";
    for (c in t.chars()) {
      let s = switch (c) {
        case ('\"') { "\\\"" };
        case ('\\') { "\\\\" };
        case ('\n') { "\\n" };
        case ('\r') { "\\r" };
        case ('\t') { "\\t" };
        case (_) { c.toText() };
      };
      result #= s;
    };
    result;
  };

  func buildHFEndpoint(modelId : Text) : Text {
    if (modelId.startsWith(#text("https://"))) {
      modelId;
    } else {
      "https://router.huggingface.co/hf-inference/models/" # modelId;
    };
  };

  // Ordered fallback list: truly free/open-source models only
  let fallbackModels : [Text] = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-2-1",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "stabilityai/stable-diffusion-v1-5",
    "CompVis/stable-diffusion-v1-4",
  ];

  func getRandomModel(seed : Nat8) : Text {
    fallbackModels[seed.toNat() % fallbackModels.size()];
  };

  func getAuthorizationHeader(apiKey : Text) : OutCall.Header {
    { name = "Authorization"; value = "Bearer " # apiKey };
  };

  func makeContentTypeHeader() : OutCall.Header {
    { name = "Content-Type"; value = "application/json" };
  };

  // Returns #ok(rawResponse) or #err(message).
  // #err with "503" prefix signals a transient overload for retry logic.
  func fetchImageData(endpoint : Text, positivePrompt : Text, negativePrompt : Text, apiKey : Text) : async GenerateImageResult {
    let safePositive = jsonEscape(positivePrompt);
    let safeNegative = jsonEscape(negativePrompt);
    let requestBody = "{\"inputs\": \"" # safePositive # "\", \"parameters\": {\"negative_prompt\": \"" # safeNegative # "\", \"width\": 512, \"height\": 512, \"output_format\": \"jpeg\"}}";
    let headers = [getAuthorizationHeader(apiKey), makeContentTypeHeader()];
    try {
      let response = await OutCall.httpPostRequest(endpoint, headers, requestBody, transform);
      // Detect 503-style overload responses returned in body
      if (
        response.contains(#text("503")) or
        response.contains(#text("overloaded")) or
        response.contains(#text("unavailable")) or
        response.contains(#text("Service Unavailable"))
      ) {
        #err("503: Server overloaded at " # endpoint # ". Trying fallback model...");
      } else {
        #ok(response);
      };
    } catch (error : Error.Error) {
      let msg = error.message();
      if (msg.contains(#text("timed out")) or msg.contains(#text("timeout"))) {
        #err("503: Request timed out calling " # endpoint # ". Trying fallback model...");
      } else if (msg.contains(#text("503"))) {
        #err("503: " # msg);
      } else {
        #err("Error calling " # endpoint # ": " # msg);
      };
    };
  };

  func parseResponse(response : Text) : (Bool, Text) {
    let dataUriPrefixJpeg = "data:image/jpeg;base64,";
    let dataUriPrefixPng = "data:image/png;base64,";
    if (response.startsWith(#text(dataUriPrefixJpeg)) or response.startsWith(#text(dataUriPrefixPng))) {
      (true, response);
    } else if (response.startsWith(#text("/9j/"))) {
      (true, dataUriPrefixJpeg # response);
    } else if (response.startsWith(#text("iVBORw0KGgo"))) {
      (true, dataUriPrefixPng # response);
    } else if (response.contains(#text("\"imageUrl\":"))) {
      // Try to extract imageUrl JSON field value
      let parts = response.split(#text("\"imageUrl\":\""));
      var found = false;
      var extracted = "";
      var first = true;
      for (part in parts) {
        if (first) {
          first := false;
        } else if (not found) {
          // Take everything up to the closing quote
          let inner = part.split(#text("\""));
          var gotFirst = false;
          for (seg in inner) {
            if (not gotFirst) {
              extracted := seg;
              gotFirst := true;
            };
          };
          found := true;
        };
      };
      if (found and extracted != "") {
        (true, extracted);
      } else {
        (false, "Unexpected response format: " # response);
      };
    } else if (response.contains(#text("\"error\""))) {
      (false, "Image generation service error: " # response);
    } else {
      (false, "Unexpected response format: " # response);
    };
  };

  // Attempt generation with fallback: try primaryModel first, then up to 2 more from fallbackModels
  func generateWithFallback(primaryModel : Text, positivePrompt : Text, negativePrompt : Text, apiKey : Text) : async GenerateImageResult {
    // Build attempt list: primary model first, then fallbacks excluding primary (up to 3 total)
    let allModels = [primaryModel, fallbackModels[0], fallbackModels[1], fallbackModels[2]];
    var attempt = 0;
    var lastErr = "Unknown error";

    label retry loop {
      if (attempt >= 3) { break retry };
      let modelId = allModels[attempt];
      let endpoint = buildHFEndpoint(modelId);
      let result = await fetchImageData(endpoint, positivePrompt, negativePrompt, apiKey);
      switch (result) {
        case (#ok(raw)) {
          let (success, parsed) = parseResponse(raw);
          if (success) {
            return #ok(parsed);
          } else {
            // Non-retryable parse error
            return #err(parsed);
          };
        };
        case (#err(msg)) {
          lastErr := msg;
          // Only retry on 503/overload/timeout signals
          if (msg.startsWith(#text("503:"))) {
            attempt += 1;
            // continue loop
          } else {
            return #err(msg);
          };
        };
      };
    };

    #err("All models are currently overloaded. Please try again in a few minutes. Last error: " # lastErr);
  };

  func getEnvironmentVariable(key : Text) : ?Text {
    environmentVariables.get(key);
  };

  public shared func generateImage(
    args : GenerateImageArgs,
    apiKey : Text,
    modelId : Text,
  ) : async GenerateImageResult {
    if (args.positivePrompt == "PING") {
      return #ok("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    };

    let defaultModel = "black-forest-labs/FLUX.1-schnell";
    let primaryModel = if (args.model == "random_model") {
      getRandomModel(Nat8.fromIntWrap(args.seed));
    } else if (modelId == "") {
      defaultModel;
    } else {
      modelId;
    };

    await generateWithFallback(primaryModel, args.positivePrompt, args.negativePrompt, apiKey);
  };

  public shared func legacyGenerateImage(args : GenerateImageArgs) : async GenerateImageResult {
    let apiKey = switch (getEnvironmentVariable("HF_TOKEN")) {
      case (null) { return #err("Error: HF_TOKEN not set. Please add your Hugging Face API token in the Secrets panel.") };
      case (?key) {
        if (key == "") { return #err("Error: HF_TOKEN is empty. Please add your Hugging Face API token in the Secrets panel.") };
        key;
      };
    };

    if (args.positivePrompt == "PING") {
      return #ok("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    };

    let envModelId = switch (getEnvironmentVariable("HF_MODEL")) {
      case (null) { "black-forest-labs/FLUX.1-schnell" };
      case (?id) { if (id == "") { "black-forest-labs/FLUX.1-schnell" } else { id } };
    };

    let primaryModel = if (args.model == "random_model") {
      getRandomModel(Nat8.fromIntWrap(args.seed));
    } else {
      envModelId;
    };

    await generateWithFallback(primaryModel, args.positivePrompt, args.negativePrompt, apiKey);
  };

  public shared func sendQueries(_ : PoseCriteria, combinations : Text) : async Text {
    poseCriteriaSet.add(combinations);
    let historyEntry : PromptHistory = {
      prompt = combinations;
      timestamp = Time.now();
      criteria = {
        bodyType = ""; age = 0; ethnicity = ""; artStyle = "";
        height = 0.0; weight = 0.0; negativePrompt = ""; aspectRatio = "";
        cameraLens = ""; clothing = ""; situationPose = ""; situationFiguration = "";
        situationBehavior = ""; situationPosing = ""; cameraAngle = "";
        lighting = ""; environment = ""; composition = "";
      };
    };
    promptHistoryList.add(historyEntry);
    combinations;
  };

  public shared func savePreset(name : Text, criteria : PoseCriteria) : async Bool {
    presetsList.add({ name; criteria });
    true;
  };

  public query func getPresets() : async [Preset] {
    presetsList.toArray();
  };

  public query func getPromptHistory() : async [PromptHistory] {
    promptHistoryList.toArray();
  };

  public query func getSituationBehaviors() : async [Text] {
    [
      "gazing wistfully into distance, gentle smile, serene contemplation",
      "laughing joyfully while twirling, carefree and energetic",
      "leaning in for a kiss, intense eye contact, romantic tension",
      "sitting cross-legged on the floor, reading a book, relaxed posture",
      "walking confidently down a street, purposeful stride, head held high",
      "dancing gracefully, arms extended, expressive movement",
      "stretching in morning light, peaceful awakening, serene expression",
      "deep in thought, chin resting on hand, contemplative gaze",
    ];
  };
};
