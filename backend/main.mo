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
import Nat32 "mo:core/Nat32";
import Blob "mo:core/Blob";
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

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func makeGetOutcall(url : Text) : async Text {
    await OutCall.httpGetRequest(url, [], transform);
  };

  func getRandomModel(seed : Nat8) : Text {
    let models = [
      "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5",
    ];
    models[seed.toNat() % models.size()];
  };

  func getAuthorizationHeader(apiKey : Text) : OutCall.Header {
    let prefix = "Bearer ";
    let fullKey = prefix # apiKey;
    { name = "Authorization"; value = fullKey };
  };

  func makeContentTypeHeader() : OutCall.Header {
    { name = "Content-Type"; value = "application/json" };
  };

  func fetchImageData(args : GenerateImageArgs, apiKey : Text) : async GenerateImageResult {
    let endpoint = args.model;

    let requestBody = "{\"inputs\": \"" # args.positivePrompt # "\", \"parameters\": { \"negative_prompt\": \"" # args.negativePrompt # "\" }}";

    let headers = [getAuthorizationHeader(apiKey), makeContentTypeHeader()];

    try {
      let response = await OutCall.httpPostRequest(endpoint, headers, requestBody, transform);
      (#ok response);
    } catch (error : Error.Error) {
      #err("Error calling " # endpoint # ": " # error.message());
    };
  };

  func parseResponse(response : Text) : (Bool, Text) {
    let dataUriPrefix = "data:image/jpeg;base64,";
    if (response.startsWith(#text(dataUriPrefix))) {
      (true, response);
    } else {
      (false, "Unexpected response format: " # response);
    };
  };

  func getEnvironmentVariable(key : Text) : ?Text {
    environmentVariables.get(key);
  };

  func nat32ToText(n : Nat32) : Text {
    n.toText();
  };

  func blobToText(blob : Blob) : Text {
    blob.toArray().toText();
  };

  public shared ({ caller }) func generateImage(
    args : GenerateImageArgs,
    apiKey : Text,
    modelId : Text,
  ) : async GenerateImageResult {
    let defaultModel = "runwayml/stable-diffusion-v1-5";
    let modelIdToUse = if (modelId == "") { defaultModel } else { modelId };
    let endpoint = "https://router.huggingface.co/hf-inference/models/" # modelIdToUse;

    let model = if (args.model == "random_model") {
      getRandomModel(Nat8.fromIntWrap(args.seed));
    } else {
      endpoint;
    };

    let response = await fetchImageData({ args with model }, apiKey);
    switch (response) {
      case (#ok(result)) {
        let (success, parsedResult) = parseResponse(result);
        if (success) { #ok(parsedResult) } else { #err(parsedResult) };
      };
      case (#err(errorMessage)) { #err(errorMessage) };
    };
  };

  public shared ({ caller }) func legacyGenerateImage(args : GenerateImageArgs) : async GenerateImageResult {
    let apiKey = switch (getEnvironmentVariable("HF_TOKEN")) {
      case (null) { return #err("Error: HF_TOKEN not set") };
      case (?key) {
        if (key == "") {
          return #err("Error: HF_TOKEN is empty");
        };
        key;
      };
    };

    let modelId = switch (getEnvironmentVariable("HF_MODEL")) {
      case (null) { "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5" };
      case (?id) { id };
    };

    let model = if (args.model == "random_model") {
      getRandomModel(Nat8.fromIntWrap(args.seed));
    } else {
      modelId;
    };

    let response = await fetchImageData({ args with model }, apiKey);
    switch (response) {
      case (#ok(result)) {
        let (success, parsedResult) = parseResponse(result);
        if (success) { #ok(parsedResult) } else { #err(parsedResult) };
      };
      case (#err(errorMessage)) { #err(errorMessage) };
    };
  };

  public shared ({ caller }) func sendQueries(_ : PoseCriteria, combinations : Text) : async Text {
    poseCriteriaSet.add(combinations);
    let historyEntry : PromptHistory = {
      prompt = combinations;
      timestamp = Time.now();
      criteria = {
        bodyType = "";
        age = 0;
        ethnicity = "";
        artStyle = "";
        height = 0.0;
        weight = 0.0;
        negativePrompt = "";
        aspectRatio = "";
        cameraLens = "";
        clothing = "";
        situationPose = "";
        situationFiguration = "";
        situationBehavior = "";
        situationPosing = "";
        cameraAngle = "";
        lighting = "";
        environment = "";
        composition = "";
      };
    };
    promptHistoryList.add(historyEntry);
    combinations;
  };

  public shared ({ caller }) func savePreset(name : Text, criteria : PoseCriteria) : async Bool {
    presetsList.add({
      name;
      criteria;
    });
    true;
  };

  public query ({ caller }) func getPresets() : async [Preset] {
    presetsList.toArray();
  };

  public query ({ caller }) func getPromptHistory() : async [PromptHistory] {
    promptHistoryList.toArray();
  };

  public query ({ caller }) func getSituationBehaviors() : async [Text] {
    [
      "gazing wistfully into distance, gentle smile, serene contemplation",
      "laughing joyfully while twirling, carefree and energetic",
      "leaning in for a kiss, intense eye contact, romantic tension",
    ];
  };
};
