export default function PageBanner({
  title,
  caption,
  image,
  alt,
}: {
  title: string;
  caption: string;
  image: string;
  alt: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-primary-100 overflow-hidden mb-6 grid sm:grid-cols-[1fr_280px]">
      <div className="p-5 sm:p-6 flex flex-col justify-center">
        <h2 className="font-semibold text-primary-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500">{caption}</p>
      </div>
      <div className="relative h-32 sm:h-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 sm:from-white/20 to-transparent" />
      </div>
    </div>
  );
}
