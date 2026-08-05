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
    <div className="relative rounded-2xl overflow-hidden mb-6 h-56 sm:h-72">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-5 sm:p-7">
        <h2 className="text-white text-xl sm:text-2xl font-bold mb-1 drop-shadow">{title}</h2>
        <p className="text-white/90 text-sm max-w-lg drop-shadow">{caption}</p>
      </div>
    </div>
  );
}
