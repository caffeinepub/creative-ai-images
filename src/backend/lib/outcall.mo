import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";

module {
  // IC management canister types for HTTP outcalls
  type IC = actor {
    http_request : shared ({
      url : Text;
      max_response_bytes : ?Nat64;
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      method : { #get; #head; #post };
      transform : ?{
        function : shared query ({
          context : Blob;
          response : {
            status : Nat;
            headers : [{ name : Text; value : Text }];
            body : Blob;
          };
        }) -> async {
          status : Nat;
          headers : [{ name : Text; value : Text }];
          body : Blob;
        };
        context : Blob;
      };
    }) -> async {
      status : Nat;
      headers : [{ name : Text; value : Text }];
      body : Blob;
    };
  };

  let ic : IC = actor "aaaaa-aa";

  public type Header = { name : Text; value : Text };

  public type TransformationInput = {
    context : Blob;
    response : {
      status : Nat;
      headers : [Header];
      body : Blob;
    };
  };

  public type TransformationOutput = {
    status : Nat;
    headers : [Header];
    body : Blob;
  };

  public func transform(input : TransformationInput) : TransformationOutput {
    { status = input.response.status; headers = []; body = input.response.body };
  };

  public func httpGetRequest(
    url : Text,
    extraHeaders : [Header],
    transformFn : shared query TransformationInput -> async TransformationOutput,
  ) : async Text {
    let response = await (with cycles = 25_000_000_000) ic.http_request({
      url;
      max_response_bytes = ?2_000_000;
      headers = extraHeaders;
      body = null;
      method = #get;
      transform = ?{
        function = transformFn;
        context = Blob.fromArray([]);
      };
    });
    switch (response.body.decodeUtf8()) {
      case (?text) { text };
      case null { Runtime.trap("empty HTTP response") };
    };
  };

  public func httpPostRequest(
    url : Text,
    extraHeaders : [Header],
    body : Text,
    transformFn : shared query TransformationInput -> async TransformationOutput,
  ) : async Text {
    let bodyBlob = body.encodeUtf8();
    let response = await (with cycles = 25_000_000_000) ic.http_request({
      url;
      max_response_bytes = ?2_000_000;
      headers = extraHeaders;
      body = ?bodyBlob;
      method = #post;
      transform = ?{
        function = transformFn;
        context = Blob.fromArray([]);
      };
    });
    if (response.status == 0) {
      Runtime.trap("empty HTTP response");
    };
    switch (response.body.decodeUtf8()) {
      case (?text) { text };
      case null { Runtime.trap("empty HTTP response") };
    };
  };
};
