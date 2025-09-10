import {EnvironmentVariables} from "@/types/environment.types";
import {REQUIRED_ENV_VARS} from "@/utils/constants.utils";

const validateEnvironment = (): EnvironmentVariables => {
    const env = import.meta.env;
    const missing: string[] = [];
    const invalid: string[] = [];

    REQUIRED_ENV_VARS.forEach((key) => {
        const value = env[key];
        if (!value) {
            missing.push(key);
        } else if (value === 'fillin' || value === 'your-value-here' || value === 'changeme') {
            invalid.push(key);
        }
    });

    if (missing.length > 0 || invalid.length > 0) {
        console.error('❌ Environment variable issues detected:');
        
        if (missing.length > 0) {
            console.error('Missing required environment variables:', missing);
        }
        
        if (invalid.length > 0) {
            console.error('Environment variables with placeholder values:', invalid);
        }
        
        if (import.meta.env.DEV) {
            console.log('💡 Update your .env file with proper values:');
            [...missing, ...invalid].forEach(key => {
                switch(key) {
                    case 'VITE_KEYCLOAK_URL':
                        console.log(`${key}=http://localhost:8080`);
                        break;
                    case 'VITE_KEYCLOAK_REALM':
                        console.log(`${key}=your-realm-name`);
                        break;
                    case 'VITE_KEYCLOAK_CLIENT_ID':
                        console.log(`${key}=your-client-id`);
                        break;
                    case 'VITE_API_BASE_URL':
                        console.log(`${key}=http://localhost:8000`);
                        break;
                    default:
                        console.log(`${key}=your_value_here`);
                }
            });
            console.log('📖 See .env.example for reference');
        }
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

export default env;