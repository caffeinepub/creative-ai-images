import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Error "mo:core/Error";
import Text "mo:core/Text";
import Map "mo:core/Map";
import MixinStorage "blob-storage/Mixin";

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

  include MixinStorage();

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

  let fallbackModels : [Text] = [
    "stabilityai/stable-diffusion-2-1",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "black-forest-labs/FLUX.1-schnell",
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

  func fetchImageData(endpoint : Text, positivePrompt : Text, negativePrompt : Text, apiKey : Text) : async GenerateImageResult {
    // Properly escape prompt strings to avoid Invalid JSON errors
    let safePositive = jsonEscape(positivePrompt);
    let safeNegative = jsonEscape(negativePrompt);
    let requestBody = "{\"inputs\": \"" # safePositive # "\", \"parameters\": {\"negative_prompt\": \"" # safeNegative # "\"}}";
    let headers = [getAuthorizationHeader(apiKey), makeContentTypeHeader()];
    try {
      let response = await OutCall.httpPostRequest(endpoint, headers, requestBody, transform);
      #ok(response);
    } catch (error : Error.Error) {
      let msg = error.message();
      if (msg.contains(#text("timed out")) or msg.contains(#text("timeout"))) {
        #err("Request timed out. The model is busy or warming up. Please try again or switch to a faster model like 'Stable Diffusion 2.1'.");
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
    } else if (response.contains(#text("503")) or response.contains(#text("overloaded")) or response.contains(#text("unavailable"))) {
      (false, "Server overloaded. Try again in a moment or switch to a different model.");
    } else if (response.contains(#text("\"error\""))) {
      (false, "Image generation service error: " # response);
    } else {
      (false, "Unexpected response format: " # response);
    };
  };

  func getEnvironmentVariable(key : Text) : ?Text {
    environmentVariables.get(key);
  };

  public shared func generateImage(
    args : GenerateImageArgs,
    apiKey : Text,
    modelId : Text,
  ) : async GenerateImageResult {
    let defaultModel = "stabilityai/stable-diffusion-2-1";
    let modelIdToUse = if (modelId == "") { defaultModel } else { modelId };

    let finalModelId = if (args.model == "random_model") {
      getRandomModel(Nat8.fromIntWrap(args.seed));
    } else {
      modelIdToUse;
    };

    if (args.positivePrompt == "PING") {
      return #ok("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    };

    let endpoint = buildHFEndpoint(finalModelId);
    switch (await fetchImageData(endpoint, args.positivePrompt, args.negativePrompt, apiKey)) {
      case (#ok(result)) {
        let (success, parsedResult) = parseResponse(result);
        if (success) { #ok(parsedResult) } else { #err(parsedResult) };
      };
      case (#err(errorMessage)) { #err(errorMessage) };
    };
  };

  public shared func legacyGenerateImage(args : GenerateImageArgs) : async GenerateImageResult {
    let apiKey = switch (getEnvironmentVariable("HF_TOKEN")) {
      case (null) { return #err("Error: HF_TOKEN not set") };
      case (?key) {
        if (key == "") { return #err("Error: HF_TOKEN is empty") };
        key;
      };
    };

    let modelId = switch (getEnvironmentVariable("HF_MODEL")) {
      case (null) { "stabilityai/stable-diffusion-2-1" };
      case (?id) { id };
    };

    let finalModelId = if (args.model == "random_model") {
      getRandomModel(Nat8.fromIntWrap(args.seed));
    } else {
      modelId;
    };

    if (args.positivePrompt == "PING") {
      return #ok("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    };

    let endpoint = buildHFEndpoint(finalModelId);
    switch (await fetchImageData(endpoint, args.positivePrompt, args.negativePrompt, apiKey)) {
      case (#ok(result)) {
        let (success, parsedResult) = parseResponse(result);
        if (success) { #ok(parsedResult) } else { #err(parsedResult) };
      };
      case (#err(errorMessage)) { #err(errorMessage) };
    };
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
    ];
  };
};
