import Set "mo:core/Set";
import Text "mo:core/Text";

module {
  type OldPoseCriteria = {
    bodyType : Text;
    age : Nat;
    ethnicity : Text;
    artStyle : Text;
    height : Float;
    weight : Float;
  };

  type OldActor = {
    poseCriteriaSet : Set.Set<Text>;
  };

  type NewPoseCriteria = {
    bodyType : Text;
    age : Nat;
    ethnicity : Text;
    artStyle : Text;
    height : Float;
    weight : Float;
    negativePrompt : Text;
  };

  type NewActor = {
    poseCriteriaSet : Set.Set<Text>;
  };

  public func run(old : OldActor) : NewActor {
    {
      poseCriteriaSet = old.poseCriteriaSet;
    };
  };
};
