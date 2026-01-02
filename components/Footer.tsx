export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8 text-center">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 flex-wrap">
          <p>&copy; {new Date().getFullYear()} Externally Yours Productions, LLC. All rights reserved.</p>
          <ul className="flex gap-6 list-none">
            <li>
              <a 
                href="https://www.facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white text-2xl transition-colors hover:text-accent"
                aria-label="Facebook"
              >
                📘
              </a>
            </li>
            <li>
              <a 
                href="https://www.instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white text-2xl transition-colors hover:text-accent"
                aria-label="Instagram"
              >
                📷
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

