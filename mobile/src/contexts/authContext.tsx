import { UserDTO } from "@dtos/UserDTO";
import { ReactNode, createContext, useEffect, useState } from "react";
import { api } from "@services/api";
import { storageUserSave, storageUserGet, storageUserRemove } from "@storage/storageUser";
import { storageAuthTokenSave, storageAuthTokenGet, storageAuthTokenRemove } from "@storage/storageAuthToken";

export type AuthContextDataProps = {
  user: UserDTO;
  isLoadingUserStorage: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  refreshedToken: string;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {

  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [refreshedToken, setRefreshedToken] = useState('');
  const [isLoadingUserStorage, setIsLoadingUserStorage] = useState(true);

  async function storageUserAndTokenSave(userData: UserDTO, token: string) {
    try {
      setIsLoadingUserStorage(true);

      await storageUserSave(userData);
      await storageAuthTokenSave(token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  function userAndTokenUpdate(userData: UserDTO, token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setUser(userData);
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/sessions', { email, password });
      if (data.user && data.token) {
        setIsLoadingUserStorage(true);

        await storageUserAndTokenSave(data.user, data.token);

        userAndTokenUpdate(data.user, data.token);
      }
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setIsLoadingUserStorage(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoadingUserStorage(true);
      setUser({} as UserDTO);
      await storageUserRemove();
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorage(false);
    }
  };

  const updateUserProfile = async (userUpdated: UserDTO) => {
    try {
      await storageUserSave(userUpdated);

      setUser(userUpdated);
    } catch (error) {
      throw error;
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoadingUserStorage(true);

      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();

      if (token && userLogged) {
        userAndTokenUpdate(userLogged, token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorage(false);
    }
  };

  const refreshTokenUpdated = (newToken: string) => {
    setRefreshedToken(newToken);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager({ signOut, refreshTokenUpdated });

    return () => subscribe();
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        isLoadingUserStorage,
        signOut,
        updateUserProfile,
        refreshedToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}