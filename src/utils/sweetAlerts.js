import Swal from "sweetalert2";

const baseOptions = {
  confirmButtonColor: "#2f7d66",
};

export const showSuccessAlert = (title, text) => {
  return Swal.fire({
    ...baseOptions,
    icon: "success",
    title,
    text,
  });
};

export const showErrorAlert = (title, text) => {
  return Swal.fire({
    ...baseOptions,
    icon: "error",
    title,
    text,
  });
};

export const showWarningAlert = (title, text) => {
  return Swal.fire({
    ...baseOptions,
    icon: "warning",
    title,
    text,
  });
};

export const showConfirmAlert = async ({ title, text, confirmText }) => {
  const result = await Swal.fire({
    ...baseOptions,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText || "Yes",
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });

  return result.isConfirmed;
};
