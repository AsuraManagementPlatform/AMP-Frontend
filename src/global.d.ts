import { EnvironmentVariables } from "@/types/environment.types";

declare global {
    var env: EnvironmentVariables;
}