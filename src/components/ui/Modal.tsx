"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { Button } from "./Button";

const ModalCloseContext = createContext<() => void>(() => {});

// Dùng trong các Client Component form bên trong Modal (VD: VendorForm, ContactForm)
// để tự đóng dialog sau khi submit thành công — không thể truyền hàm `close` từ
// Server Component xuống Modal (Client Component) qua props/children vì React Server
// Components không cho phép function làm children, nên phải lấy qua context.
export function useModalClose() {
  return useContext(ModalCloseContext);
}

export function Modal({
  triggerLabel,
  title,
  children,
  triggerVariant = "primary",
}: {
  triggerLabel: string;
  title: string;
  children: ReactNode;
  triggerVariant?: "primary" | "secondary" | "ghost";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  const open = () => ref.current?.showModal();
  const close = () => ref.current?.close();

  return (
    <>
      <Button variant={triggerVariant} onClick={open} type="button">
        {triggerLabel}
      </Button>
      <dialog
        ref={ref}
        className="m-auto w-full max-w-lg rounded-xl border border-border bg-white p-0 shadow-xl backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-1 text-foreground/50 hover:bg-brand-light hover:text-foreground"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">
          <ModalCloseContext.Provider value={close}>{children}</ModalCloseContext.Provider>
        </div>
      </dialog>
    </>
  );
}
