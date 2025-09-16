import React from "react";

type Props = {};

export default function LettersPage({}: Props) {
  return (
    <div className="p-10">
      <div className="flex">
        <div>
          <button>RECEIVED</button>
          <button>SEND</button>
        </div>
        <div>Compsoe</div>
      </div>
      <div className="flex gap-0">
        <div className="w-96 space-y-10 ">
          {[1, 2, 3, 4].map((item, index) => (
            <div key={index} className="bg-red-900">
              <h1>June 12, 2024</h1>
              <h1>Dear Ella</h1>
              <h1 className="truncate">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Eaque
                reiciendis ex reprehenderit eum perferendis ipsa, eveniet
                possimus neque dolorum, impedit dignissimos libero ducimus
                recusandae nulla minima veritatis commodi in quibusdam?
              </h1>
            </div>
          ))}
        </div>
        <div className="bg-red-200">asdsad</div>
      </div>
    </div>
  );
}
