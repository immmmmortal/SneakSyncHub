import React, {useState} from "react";
import {faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {toast} from "react-toastify";

const DeleteProductButtonComponent = ({
                                          id,
                                          handleDelete,
                                      }: {
    id: number;
    handleDelete: (id: number) => Promise<void>; // Ensure handleDelete returns a Promise
}) => {
    const [error, setError] = useState<string | null>(null);
    const [deleteLoadingState, setDeleteLoadingState] = useState(false);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevent default button behavior

        setDeleteLoadingState(true); // Start loading state

        try {
            await handleDelete(id);
        } catch (err) {
            setError(`${err}`);
            toast.error(error);
        } finally {
            setDeleteLoadingState(false);
        }
    };

    return (
        <button
            key={id}
            onClick={handleClick}
            data-tooltip-id="shoe-name"
            data-tooltip-content="Delete this shoe?"
            className="bg-sneakers-second w-7 h-7 hover:bg-red-500 rounded top-2 left-2 flex items-center justify-center"
        >
            {deleteLoadingState ? (
                <div
                    className="w-4 h-4 border-4 border-t-4 border-t-white border-transparent rounded-full animate-spin"
                ></div>
            ) : (
                <FontAwesomeIcon icon={faTrashCan}
                                 data-tooltip-id="delete-shoe-tooltip"
                />
            )}
        </button>
    );
};

export default DeleteProductButtonComponent;
