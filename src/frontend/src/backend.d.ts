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
    artStyle: string;
    ethnicity: string;
    negativePrompt: string;
    bodyType: string;
}
export interface backendInterface {
    sendQueries(arg0: PoseCriteria, combinations: string): Promise<string>;
}
