export default function WidgetCopa() {
  return (
    <div className="space-y-3">
      <iframe
        src="https://widget.api-futebol.com.br/render/widget_f9721fb89f50a9aa"
        title="API Futebol - Próximos Jogos"
        referrerPolicy="unsafe-url"
        className="w-full rounded-xl border border-gray-200"
        style={{ height: 330, display: 'block' }}
      />
      <iframe
        src="https://widget.api-futebol.com.br/render/widget_0aa42a69003664f9"
        title="API Futebol - Widget"
        referrerPolicy="unsafe-url"
        className="w-full rounded-xl border border-gray-200"
        style={{ height: 700, display: 'block' }}
      />
    </div>
  )
}
