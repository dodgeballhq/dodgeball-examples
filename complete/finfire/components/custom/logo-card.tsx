import Image from "next/image";
import { Card } from "../ui/card";

interface LogoCardProps {
  children: React.ReactNode;
}

const LogoCard: React.FC<LogoCardProps> = ({ children }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-300 rounded-lg">
      <Image src="/images/finfire-wide.svg" alt="FinFire" className="p-8 mx-auto" width={190} height={0} />
      <Card className="w-[350px] rounded-t-none">{children}</Card>
    </div>
  );
};

export default LogoCard;
