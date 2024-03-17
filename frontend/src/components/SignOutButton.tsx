import { useMutation, useQueryClient } from "react-query";
import * as apiClient from "../api-client";
import { useAppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";

const SignOutButton = () => {
  const queryClient = useQueryClient();

  const { showToast } = useAppContext();
  const navigate = useNavigate();
  const mutation = useMutation(apiClient.signOut, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("ValidateToken");
      showToast({ message: "Sign Out Success", type: "SUCCESS" });
      navigate("/sign-in");
    },
    onError: () => {
      showToast({ message: "Sign out Faled", type: "ERROR" });
    },
  });
  const handleClick = () => {
    mutation.mutate();
  };
  return (
    <button
      onClick={handleClick}
      className="text-blue-600 px-3 font-bold hover:bg-gray-100 bg-white"
    >
      Sign Out
    </button>
  );
};

export default SignOutButton;
