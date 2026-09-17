"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { message: string | null };

export class ErrorCatch extends Component<Props, State> {
  state: State = { message: null };

  static getDerivedStateFromError(error: Error) {
    return { message: error?.message || "The page failed to render." };
  }

  render() {
    if (!this.state.message) return this.props.children;
    return (
      <div className="feed-card p-8">
        <p className="kicker text-blood">Feed error</p>
        <h1 className="mt-3 font-display text-4xl font-light text-ink">Couldn’t open this view</h1>
        <p className="mt-3 max-w-xl text-sm text-mute">{this.state.message}</p>
        <button type="button" className="btn btn-ink mt-6" onClick={() => this.setState({ message: null })}>
          Try again
        </button>
      </div>
    );
  }
}
