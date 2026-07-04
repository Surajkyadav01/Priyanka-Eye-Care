import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const hasValidConfig = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId;

let app: any = null;
let dbInstance: any = null;

if (hasValidConfig) {
  try {
    const config = {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    };
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    try {
      dbInstance = firebaseConfig.firestoreDatabaseId 
        ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
        : getFirestore(app);
    } catch (dbErr) {
      console.warn(`Failed to initialize custom named database '${firebaseConfig.firestoreDatabaseId}', falling back to '(default)':`, dbErr);
      dbInstance = getFirestore(app);
    }
    console.log('Firebase Firestore client initialized successfully with project ID:', firebaseConfig.projectId);
  } catch (err) {
    console.error('Failed to initialize Firebase client:', err);
  }
} else {
  console.warn('Firebase configuration is missing or incomplete. Using fallback static/local modes.');
}

// Export safe db: if real instance is null, return a Proxy to prevent crashing on module load
export const db = dbInstance || (new Proxy({}, {
  get(target, prop) {
    return () => {
      throw new Error('Firebase is not initialized due to missing or empty configuration.');
    };
  }
}) as any);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default db;
