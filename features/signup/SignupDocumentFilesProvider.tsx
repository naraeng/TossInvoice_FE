'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

type SignupDocumentFilesContextValue = {
  businessFile: File | null;
  setBusinessFile: Dispatch<SetStateAction<File | null>>;
  bankbookFile: File | null;
  setBankbookFile: Dispatch<SetStateAction<File | null>>;
};

const SignupDocumentFilesContext = createContext<SignupDocumentFilesContextValue | null>(null);

/** `/signup` ↔ `/signup/account` 이동 시에도 업로드 파일이 유지되도록 레이아웃 단에서 보관합니다. */
export function SignupDocumentFilesProvider({ children }: { children: ReactNode }) {
  const [businessFile, setBusinessFile] = useState<File | null>(null);
  const [bankbookFile, setBankbookFile] = useState<File | null>(null);

  const value = useMemo(
    () => ({
      businessFile,
      setBusinessFile,
      bankbookFile,
      setBankbookFile,
    }),
    [businessFile, bankbookFile],
  );

  return (
    <SignupDocumentFilesContext.Provider value={value}>{children}</SignupDocumentFilesContext.Provider>
  );
}

export function useSignupDocumentFiles() {
  const ctx = useContext(SignupDocumentFilesContext);
  if (!ctx) {
    throw new Error('useSignupDocumentFiles는 SignupDocumentFilesProvider 안에서만 사용할 수 있어요.');
  }
  return ctx;
}
