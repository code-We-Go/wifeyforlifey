export function TestimonialCard({
  name,
  text,
  supporters,
  img,
  logo,
  direction,
  index,
}: any) {
  // Rotation values for a playful look
  const rotations = [
    "-rotate-6",
    "-rotate-3",
    "rotate-2",
    "rotate-3",
    "rotate-6",
    "-rotate-2",
  ];
  // Pick a rotation based on index or direction
  const rotationClass = rotations[index % rotations.length];
  return (
    <div
      //   className={`relative bg-lovely rounded-2xl ${direction === "left" ? "rounded-bl-none" : "rounded-br-none" }
      className={`relative bg-lovely rounded-2xl 
       shadow-lg p-2 flex justify-start  flex-col items-center w-52 text-creamey min-h-[80px] h-auto border ${rotationClass} `}
      style={{ marginBottom: "2.5rem" }}
    >
      {/* Avatar */}
      {/* <div className="mb-2"> */}
      {/* {img ? (
          <img
            src={img}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
            {logo}
          </div>
        )} */}
      {/* </div> */}
      <div className="font-semibold text-creamey mb-1">{name}</div>
      <div className="text-center text-base font-medium text-creamey mb-1">
        {text}
      </div>
      {/* {supporters && (
        <div className="text-creamey/80 text-sm flex items-center gap-1">
          <span role="img" aria-label="heart">
            ♡
          </span>{" "}
          {supporters}
        </div>
      )} */}
      {/* Chat bubble tail */}
      <div
        className={`absolute -bottom-4 ${
          direction === "left" ? "left-6" : "right-6"
        } w-4 h-4 overflow-visible text-lovely pointer-events-none`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
        >
          {/* Simple triangle for classic chat bubble tail */}
          <polygon points="0,0 16,0 8,16" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
