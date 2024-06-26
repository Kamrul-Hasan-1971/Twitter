import { firebaseConfig } from "configs/firebase-config";

export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  },
  baseUrl: 'https://mp-genai-server-m4qxsy2tcq-uc.a.run.app',
};
