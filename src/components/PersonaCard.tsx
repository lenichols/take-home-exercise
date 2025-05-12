'use client';
import { Card } from "flowbite-react";
import type { Persona } from "@/types";
import Link from "next/link";
import Image from "next/image";

type PersonaCardProps = {
  persona: Persona;
  index: number;
};

export default function PersonaCard({ persona, index }: PersonaCardProps) {
  console.log("Persona index received:", index);

  // Determine which profile image to use based on gender
  const profileImage = persona.gender.toLowerCase().includes('female') || 
                      persona.gender.toLowerCase().includes('woman') ? 
                      '/woman-avatar.svg' : '/man-avatar.svg';

  return (
    <Link href={`/chat/${index}`} className="h-full">
      <Card className="cursor-pointer hover:shadow-lg transition h-full flex flex-col">
        <div className="flex justify-center mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <Image 
              src={profileImage} 
              alt={`${persona.name}'s profile`} 
              width={80} 
              height={80} 
              className="object-cover"
            />
          </div>
        </div>
        <h5 className="text-xl font-bold tracking-tight text-gray-900 text-center">
          {persona.name}, {persona.age}
        </h5>
        <div className="flex-grow flex flex-col">
          <p className="text-sm text-gray-600">
            <strong>Job Title:</strong> {persona.jobTitle}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Location:</strong> {persona.location}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Challenge:</strong> {persona.challenge}
          </p>
        </div>
      </Card>
    </Link>
  );
}
