// components/WhiteboardErrorBoundary.jsx
import { Component } from "react";

export default class WhiteboardErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[whiteboard] render error, contained by boundary", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ color: "white", padding: 16 }}>
          Whiteboard failed to load: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}