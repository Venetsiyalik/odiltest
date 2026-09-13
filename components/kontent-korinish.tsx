import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * Dars materiallari va savol izohlari shu yerda Markdown sifatida
 * saqlanadi (qalin, ro'yxat, rasm, kod bloki `remark-gfm` orqali; formula
 * `$...$`/`$$...$$` `remark-math` + `rehype-katex` orqali). To'liq HTML
 * muharriri emas — bu yondashuv XSS xavfisiz va kontentni oddiy matn
 * sifatida saqlaydi (5-band, "oddiy matn muharriri" talabini qamraydi).
 */
export function KontentKorinish({ matn }: { matn: string }) {
  return (
    <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {matn}
      </ReactMarkdown>
    </div>
  );
}
