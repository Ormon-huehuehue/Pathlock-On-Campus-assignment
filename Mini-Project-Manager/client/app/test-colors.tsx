export default function TestColors() {
  return (
    <div className="p-4">
      <div className="bg-lightGreen text-darkGreen p-2 mb-2">
        Light green bg, dark green text
      </div>
      <div className="bg-red-500 text-white p-2">
        Regular Tailwind color (should work)
      </div>
    </div>
  );
}