import {
  MessageCircle,
  Phone,
  CheckCircle2,
  Mail,
} from "lucide-react";

export default function DoYouNeedHelp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-5 shadow-md">
            <MessageCircle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 mb-3">
            Centro de Ayuda
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-amber-500 to-orange-600 mx-auto rounded-full mb-4" />
          <p className="text-slate-600 text-lg leading-relaxed max-w-xl mx-auto">
            Contacta al equipo de soporte si necesitas ayuda con el registro,
            la recepción o la evaluación de una boleta.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Contacto de Soporte
            </h2>
          </div>
          <div className="mb-6 ml-[52px]">
            <p className="font-bold text-slate-800 text-lg">Luis González</p>
            <p className="text-slate-500">
              Si necesitas ayuda adicional, puedes comunicarte a través de los siguientes medios:
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <a
              href="tel:+50230073811"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  Llamada Telefónica
                </p>
                <p className="text-xs text-amber-600 font-medium">Corporativo</p>
                <p className="text-sm text-slate-500">+502 3007-3811</p>
              </div>
            </a>

            <a
              href="https://wa.me/50230073811"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                <MessageCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  WhatsApp
                </p>
                <p className="text-xs text-amber-600 font-medium">Corporativo</p>
                <p className="text-sm text-slate-500">Respuesta más ágil</p>
              </div>
            </a>

            <a
              href="mailto:soportetecnico.tejar02@legumex.net"
              className="group flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-amber-400 hover:bg-amber-50 transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-all">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                  Correo Electrónico
                </p>
                <p className="text-xs text-amber-600 font-medium">Corporativo</p>
                <p className="text-sm text-slate-500 truncate max-w-[140px]">soportetecnico.tejar02@legumex.net</p>
              </div>
            </a>
          </div>

        </div>

        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 shadow-xl text-white text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-90" />
          <p className="font-semibold text-lg mb-1">Información para solicitar ayuda</p>
          <p className="text-white/90 leading-relaxed text-sm">
            Indica el número de boleta, la pantalla donde ocurrió el problema
            y el mensaje que aparece para facilitar la atención.
          </p>
        </div>
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-40 animate-ping" />
        <div
          className="absolute top-3/4 right-1/4 w-3 h-3 bg-orange-400 rounded-full opacity-40 animate-ping"
          style={{ animationDelay: "700ms" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-amber-500 rounded-full opacity-40 animate-ping"
          style={{ animationDelay: "1400ms" }}
        />
      </div>
    </div>
  );
}
