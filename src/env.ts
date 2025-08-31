import {EnvironmentVariables} from "@/types/environment.types";
import {REQUIRED_ENV_VARS} from "@/utils/constants.utils";

const validateEnvironment = (): EnvironmentVariables => {
    const env = import.meta.env;
    const missing: string[] = [];

    REQUIRED_ENV_VARS.forEach((key) => {
        if (!env[key]) {
            missing.push(key);
        }
    });

    if (missing.length > 0 && import.meta.env.DEV) {
        console.error('❌ Missing required environment variables:', missing);
        console.log('💡 Create a .env file with:');
        missing.forEach(key => console.log(`${key}=your_value_here`));
    }

    return {
        VITE_KEYCLOAK_URL: env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
        VITE_KEYCLOAK_REALM: env.VITE_KEYCLOAK_REALM || 'default',
        VITE_KEYCLOAK_CLIENT_ID: env.VITE_KEYCLOAK_CLIENT_ID || 'default',
        VITE_API_BASE_URL: env.VITE_API_BASE_URL || 'http://localhost:8000'
    };
};

const env = validateEnvironment();

globalThis.env = env;