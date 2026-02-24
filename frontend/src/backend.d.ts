import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PoseCriteria {
    age: bigint;
    weight: number;
    height: number;
    cameraAngle: string;
    clothing: string;
    situationFiguration: string;
    situationPose: string;
    lighting: string;
    artStyle: string;
    environment: string;
    cameraLens: string;
    ethnicity: string;
    situationPosing: string;
    negativePrompt: string;
    bodyType: string;
    composition: string;
    situationBehavior: string;
    aspectRatio: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface PromptHistory {
    timestamp: Time;
    criteria: PoseCriteria;
    prompt: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Preset {
    name: string;
    criteria: PoseCriteria;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface backendInterface {
    getPresets(): Promise<Array<Preset>>;
    getPromptHistory(): Promise<Array<PromptHistory>>;
    savePreset(name: string, criteria: PoseCriteria): Promise<boolean>;
    sendQueries(arg0: PoseCriteria, combinations: string): Promise<string>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
