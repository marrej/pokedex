
import {ToastNotification} from "@carbon/react"
import {ToastProps} from "@/lib/features/toast/toastSlice"
import { useAppDispatch } from "@/lib/hooks";
import { clearToast } from "@/lib/features/toast/toastSlice";

export const ToastContainer = ({ title, kind, timeout = 10000 }: ToastProps) => {
    const dispatch = useAppDispatch();
    return <ToastNotification
                timeout={timeout}
                onClose={() => {dispatch(clearToast());}}
                kind={kind}
                title={title}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 9999,
                }}
            />;
    };