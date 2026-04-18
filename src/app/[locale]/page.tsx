import Image from "next/image";
import bgLirnexa from "../../../public/lirnexa.jpg"

export default function Home() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Image src={bgLirnexa} alt="Background" />
    </div>
  );
}
