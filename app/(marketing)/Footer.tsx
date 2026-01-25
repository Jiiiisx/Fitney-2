"use client";

const navigation = {
  links: [
    { name: "Tentang", href: "#" },
    { name: "Harga", href: "#" },
    { name: "Kebijakan Privasi", href: "#" },
    { name: "Kontak", href: "#" },
  ],
  social: [
    {
      name: "X / Twitter",
      href: "#",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      href: "#",
      icon: (props: any) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
          <path
            fillRule="evenodd"
            d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm-1.163 1.943c-1.044.048-1.695.21-2.258.435a3.097 3.097 0 00-1.15.748 3.097 3.097 0 00-.748 1.15c-.225.563-.387 1.214-.435 2.258-.048 1.02-.06 1.344-.06 3.72s.012 2.7.06 3.72c.048 1.044.21 1.695.435 2.258a3.097 3.097 0 00.748 1.15 3.097 3.097 0 001.15.748c.563.225 1.214.387 2.258.435 1.02.048 1.344.06 3.72.06s2.7-.012 3.72-.06c1.044-.048 1.695-.21 2.258-.435a3.097 3.097 0 001.15-.748 3.097 3.097 0 00.748-1.15c.225-.563.387-1.214.435-2.258.048-1.02.06-1.344.06-3.72s-.012-2.7-.06-3.72c-.048-1.044-.21-1.695-.435-2.258a3.097 3.097 0 00-.748-1.15 3.097 3.097 0 00-1.15-.748c-.563-.225-1.214-.387-2.258-.435-1.02-.048-1.344-.06-3.72-.06s-2.7.012-3.72.06zm2.17 1.944a4.112 4.112 0 100 8.224 4.112 4.112 0 000-8.224zM12 14.333a2.333 2.333 0 110-4.666 2.333 2.333 0 010 4.666zm4.333-6.333a.96.96 0 100-1.92.96.96 0 000 1.92z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#fff9e6] border-t border-gray-200/50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container mx-auto px-6 pb-8 pt-16 lg:px-12 lg:pt-24">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-24">
          {/* Brand Info */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm mx-auto lg:mx-0">
            <h1 className="text-3xl font-black text-yellow-500 tracking-tighter">Fitney</h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              Transformasikan perjalanan kebugaran Anda dengan Fitney. Pantau latihan, nutrisi, dan raih gol kesehatan Anda dengan bantuan teknologi cerdas.
            </p>
            <div className="mt-6 flex space-x-5">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-yellow-500 transition-all hover:scale-110"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-16 mx-auto lg:mx-0">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b-2 border-yellow-400 pb-1 inline-block">
                Navigasi
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.links.slice(0, 2).map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 border-b-2 border-yellow-400 pb-1 inline-block">
                Bantuan
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {navigation.links.slice(2).map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 border-t border-gray-900/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <p className="text-xs font-medium text-gray-500">
            &copy; 2025 Fitney Inc. Semua hak dilindungi.
          </p>
          <div className="flex gap-6">
             <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Kebijakan</a>
             <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest">Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
