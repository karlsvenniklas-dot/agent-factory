interface TitleBarProps {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function TitleBar({ onMouseDown }: TitleBarProps) {
  return (
    <div className="player-title-bar" onMouseDown={onMouseDown}>
      <div className="title-bar-left">
        <div className="winamp-logo">
          <span className="logo-text">Winamp</span>
        </div>
      </div>
      <div className="title-bar-right">
        <button className="title-btn" aria-label="Menu">☰</button>
        <button className="title-btn minimize" aria-label="Minimize">_</button>
        <button className="title-btn close" aria-label="Close">×</button>
      </div>
    </div>
  );
}
