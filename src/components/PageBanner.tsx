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
    <div className="relative rounded-2xl overflow-hidden mb-6 h-48 sm:h-64 lg:h-72 bg-primary-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/0" />
      <div className="absolute bottom-0 left-0 p-4 sm:p-6">
        <h2 className="text-white text-lg sm:text-2xl font-bold mb-1 drop-shadow">{title}</h2>
        <p className="text-white/90 text-xs sm:text-sm max-w-lg drop-shadow">{caption}</p>
      </div>
    </div>
  );
}
