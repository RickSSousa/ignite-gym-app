import {
  storageAuthTokenGet,
  storageAuthTokenSave,
} from "@storage/storageAuthToken";
import { AppError } from "@utils/AppError";
import axios, { AxiosInstance } from "axios";

type PromiseType = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

type ProcessQueueParams = {
  error: Error | null;
  token: string | null;
};

type registerInterceptTokenManagerProps = {
  signOut: () => void;
  refreshTokenUpdated: (newToken: string) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: ({}: registerInterceptTokenManagerProps) => () => void;
};

const api = axios.create({
  baseURL: "http://192.168.0.101:3333",
}) as APIInstanceProps;

let isRefreshing = false;
let failedQueue: Array<PromiseType> = [];

const processQueue = ({ error, token }: ProcessQueueParams): void => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

api.registerInterceptTokenManager = ({ signOut, refreshTokenUpdated }) => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    async (requestError) => {
      if (requestError?.response?.status === 401) {
        if (
          requestError.response.data?.message === "token.expired" ||
          requestError.response.data?.message === "token.invalid"
        ) {
          const currentToken = await storageAuthTokenGet();

          if (!currentToken) {
            signOut();
            return Promise.reject(requestError);
          }

          const originalRequest = requestError.config;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return axios(originalRequest);
              })
              .catch((error) => {
                throw error;
              });
          }

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              console.log(" currentToken: ", currentToken);
              const { data } = await api.post("/sessions/refresh-token", {
                token: currentToken,
              });
              console.log("REFRESH TOKEN", data.token);
              await storageAuthTokenSave(data.token);

              api.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.token}`;
              originalRequest.headers["Authorization"] = `Bearer ${data.token}`;

              refreshTokenUpdated(data.token);
              processQueue({ error: null, token: data.token });

              resolve(originalRequest);
            } catch (error: any) {
              console.log("FUDEU", error);
              processQueue({ error, token: null });
              reject(error);
            }
          });
        }
        signOut();
      }

      if (requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message));
      } else {
        return Promise.reject(requestError);
      }
    }
  );

  return () => {
    api.interceptors.response.eject(interceptor);
  };
};

export { api };
