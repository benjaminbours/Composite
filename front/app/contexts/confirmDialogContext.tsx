'use client';
import {
    useCallback,
    useContext,
    useState,
    createContext,
    useRef,
} from 'react';
import { ConfirmDialog } from '../02_molecules/ConfirmDialog';

interface ConfirmDialogContent {
    title: string;
    message: string | JSX.Element;
    cancelText: string;
    confirmText: string;
}

interface ConfirmDialogContextProviderProps {
    children: React.ReactNode;
}

interface ConfirmDialogContext {
    showConfirmation: (content: ConfirmDialogContent) => Promise<boolean>;
    closeConfirmation: () => void;
}

export const ConfirmDialogContext = createContext<ConfirmDialogContext>(
    {} as ConfirmDialogContext,
);

type UseDialogShowReturnType = {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    show: boolean;
    setShow: (value: boolean) => void;
    onHide: () => void;
};

export const useDialogShow = (): UseDialogShowReturnType => {
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOnHide = useCallback(() => {
        setIsLoading(false);
        setShow(false);
    }, []);

    return {
        isLoading,
        setIsLoading,
        show,
        setShow,
        onHide: handleOnHide,
    };
};

export const ConfirmDialogContextProvider: React.FC<
    ConfirmDialogContextProviderProps
> = ({ children }) => {
    const { setShow, show, onHide, isLoading, setIsLoading } = useDialogShow();
    const [content, setContent] = useState<ConfirmDialogContent | null>();
    const resolver = useRef<(...args: any[]) => any>();

    const handleShow = useCallback(
        (content: ConfirmDialogContent): Promise<boolean> => {
            setContent(content);
            setShow(true);
            return new Promise((resolve) => {
                resolver.current = resolve;
            });
        },
        [setShow],
    );

    const dialogContext: ConfirmDialogContext = {
        showConfirmation: handleShow,
        closeConfirmation: onHide,
    };

    const handleOk = () => {
        if (resolver.current) {
            resolver.current(true);
        }
        setIsLoading(true);
    };

    const handleCancel = () => {
        if (resolver.current) {
            resolver.current(false);
        }
        onHide();
    };

    console.log('dialog ctx', dialogContext);

    return (
        <ConfirmDialogContext.Provider value={dialogContext}>
            {children}
            {content && (
                <ConfirmDialog
                    open={show}
                    title={content.title}
                    message={content.message}
                    cancelText={content.cancelText}
                    confirmText={content.confirmText}
                    isLoading={isLoading}
                    onCancel={handleCancel}
                    onConfirm={handleOk}
                />
            )}
        </ConfirmDialogContext.Provider>
    );
};

export const useConfirmDialogContext = (): ConfirmDialogContext =>
    useContext(ConfirmDialogContext);
