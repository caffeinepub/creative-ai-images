import Set "mo:core/Set";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  type OldPoseCriteria = {
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
  };

  type OldPreset = {
    name : Text;
    criteria : OldPoseCriteria;
  };

  type OldPromptHistory = {
    prompt : Text;
    timestamp : Time.Time;
    criteria : OldPoseCriteria;
  };

  type OldActor = {
    poseCriteriaSet : Set.Set<Text>;
    presetsList : List.List<OldPreset>;
    promptHistoryList : List.List<OldPromptHistory>;
  };

  type NewPoseCriteria = {
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

  type NewPreset = {
    name : Text;
    criteria : NewPoseCriteria;
  };

  type NewPromptHistory = {
    prompt : Text;
    timestamp : Time.Time;
    criteria : NewPoseCriteria;
  };

  type NewActor = {
    poseCriteriaSet : Set.Set<Text>;
    presetsList : List.List<NewPreset>;
    promptHistoryList : List.List<NewPromptHistory>;
  };

  func convert(oldCriteria : OldPoseCriteria) : NewPoseCriteria {
    { oldCriteria with cameraAngle = ""; lighting = ""; environment = ""; composition = "" };
  };

  public func run(old : OldActor) : NewActor {
    let newPresetsList = old.presetsList.map<OldPreset, NewPreset>(func(oldPreset) { { oldPreset with criteria = convert(oldPreset.criteria) } });
    let newPromptHistoryList = old.promptHistoryList.map<OldPromptHistory, NewPromptHistory>(
      func(oldHistory) { { oldHistory with criteria = convert(oldHistory.criteria) } }
    );

    {
      old with
      presetsList = newPresetsList;
      promptHistoryList = newPromptHistoryList;
    };
  };
};
