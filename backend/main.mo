import Set "mo:core/Set";
import Text "mo:core/Text";
import List "mo:core/List";
import Time "mo:core/Time";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
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

  let poseCriteriaSet = Set.empty<Text>();

  let presetsList = List.empty<Preset>();
  let promptHistoryList = List.empty<PromptHistory>();

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func makeGetOutcall(url : Text) : async Text {
    await OutCall.httpGetRequest(url, [], transform);
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
        cameraAngle = ""; // Default empty string for new fields
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
};
