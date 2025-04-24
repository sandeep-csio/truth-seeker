import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { SignedOut, SignInButton, useAuth } from "@clerk/clerk-react";
import { ChevronRight, Mail } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.isSignedIn) {
    console.log("User is signed in, redirecting to home page...");
    navigate("/");
    return <>Loading</>;
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <img
            src="/logo1.svg"
            alt="Logo"
            className=" w-20 h-20 rounded-lg mb-3"
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-900">
          Truth Seeker
          <span className="text-app-blue"> AI Review</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Efficiently evaluate LLM-generated responses
        </p>
      </div>

      <div
       className="flex flex-row-reverse gap-3"
      >
        
      <Button>
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
        <Mail/>
      </Button>

      <Button
       variant="outline"
      >
        Learn More <ChevronRight/>
       </Button>
      </div>
    </div>
  );
};

export default Signin;
