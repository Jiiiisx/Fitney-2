export default function HowItWorks() {
  return (
    <div className="bg-gray-800 py-12 lg:py-20">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <h2 className="text-2xl lg:text-3xl font-black mb-10 lg:mb-12 text-white uppercase tracking-[0.2em]">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-gray-700/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/5 flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-yellow-400 text-gray-800 font-black text-xl lg:text-2xl mb-4 lg:mb-6 shadow-lg shadow-yellow-400/20">
              1
            </div>
            <h3 className="text-lg lg:text-xl font-bold mb-2 text-white tracking-tight">Personalization</h3>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              Fill out your profile & goals (lose weight, build muscle, etc.)
              to get a completely customized experience.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-gray-700/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/5 flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-yellow-400 text-gray-800 font-black text-xl lg:text-2xl mb-4 lg:mb-6 shadow-lg shadow-yellow-400/20">
              2
            </div>
            <h3 className="text-lg lg:text-xl font-bold mb-2 text-white tracking-tight">
              Guided Training
            </h3>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              Get daily workout & nutrition plans specially created to
              reach your unique targets.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-gray-700/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-white/5 flex flex-col items-center">
            <div className="flex items-center justify-center h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-yellow-400 text-gray-800 font-black text-xl lg:text-2xl mb-4 lg:mb-6 shadow-lg shadow-yellow-400/20">
              3
            </div>
            <h3 className="text-lg lg:text-xl font-bold mb-2 text-white tracking-tight">
              Monitor Progress
            </h3>
            <p className="text-gray-400 text-sm lg:text-base leading-relaxed">
              See your progress every week with easy-to-understand charts and
              data. Celebrate every achievement!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}