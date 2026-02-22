import Set "mo:core/Set";
import Text "mo:core/Text";
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
  };

  let poseCriteriaSet = Set.empty<Text>();

  public shared ({ caller }) func sendQueries(_ : PoseCriteria, combinations : Text) : async Text {
    poseCriteriaSet.add(combinations);
    combinations;
  };
};
