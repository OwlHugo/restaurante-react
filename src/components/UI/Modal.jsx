import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function Modal({ children, open, onClose, className = '' }) {
    const dialog = useRef();

    useEffect(() => {
        const modal = dialog.current;
        if (open) {
            modal.showModal(); 
        } else {
            modal.close(); 
        }
    }, [open]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return createPortal(
        <dialog
            ref={dialog}
            className={`modal ${className}`}
            onClose={handleClose} 
        >
            {children}
        </dialog>,
        document.getElementById('modal') 
    );
}
