import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/** Ловит ошибки рендера, чтобы вместо белого экрана показать аккуратный
 *  фолбэк с кнопкой перезагрузки. Критично для прод-надёжности. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Лог в консоль (и сюда позже можно подключить Sentry).
    console.error('UI error:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-paper px-6 text-center text-ink">
        <h1 className="font-heading text-[clamp(40px,8vw,96px)] font-bold uppercase leading-none tracking-[0.02em]">
          Что-то пошло не так
        </h1>
        <p className="max-w-md text-base leading-7 text-ink-soft">
          Произошла ошибка при загрузке страницы. Попробуйте обновить или вернуться на главную.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-accent-deep"
        >
          На главную
        </button>
      </div>
    );
  }
}
