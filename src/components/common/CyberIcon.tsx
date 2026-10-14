"use client";

import React from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Bug,
  Key,
  Lock,
  Eye,
  Skull,
  Brain,
  Network,
  Wifi,
  Cpu,
  Ghost,
  Swords,
  Radar,
  Fingerprint,
  Gauge,
  Flag,
  Code,
  Server,
  Database,
  Crown,
  Compass,
  Crosshair,
  type LucideProps,
} from "lucide-react";

export type CyberIconName =
  | "shield"
  | "shield-check"
  | "shield-alert"
  | "terminal"
  | "bug"
  | "key"
  | "lock"
  | "eye"
  | "skull"
  | "brain"
  | "network"
  | "wifi"
  | "cpu"
  | "ghost"
  | "swords"
  | "radar"
  | "fingerprint"
  | "gauge"
  | "flag"
  | "code"
  | "server"
  | "database"
  | "crown"
  | "compass"
  | "crosshair";

const ICON_MAP: Record<CyberIconName, React.ComponentType<LucideProps>> = {
  shield: Shield,
  "shield-check": ShieldCheck,
  "shield-alert": ShieldAlert,
  terminal: Terminal,
  bug: Bug,
  key: Key,
  lock: Lock,
  eye: Eye,
  skull: Skull,
  brain: Brain,
  network: Network,
  wifi: Wifi,
  cpu: Cpu,
  ghost: Ghost,
  swords: Swords,
  radar: Radar,
  fingerprint: Fingerprint,
  gauge: Gauge,
  flag: Flag,
  code: Code,
  server: Server,
  database: Database,
  crown: Crown,
  compass: Compass,
  crosshair: Crosshair,
};

export const CYBER_ICON_NAMES: CyberIconName[] = [
  "shield",
  "terminal",
  "bug",
  "key",
  "lock",
  "eye",
  "skull",
  "brain",
  "network",
  "wifi",
  "cpu",
  "ghost",
  "swords",
  "radar",
  "fingerprint",
  "gauge",
  "flag",
  "code",
  "server",
  "database",
  "crown",
  "compass",
  "crosshair",
];

/** Avatars offered to the learner for their profile. */
export const AVATAR_OPTIONS: CyberIconName[] = [
  "shield",
  "skull",
  "ghost",
  "bug",
  "terminal",
  "code",
  "key",
  "lock",
  "eye",
  "brain",
  "wifi",
  "crown",
];

export interface CyberIconProps {
  name: CyberIconName | string;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Line-art cyber-security icon set used across the platform.
 */
export const CyberIcon: React.FC<CyberIconProps> = ({
  name,
  className = "",
  size = 28,
  color = "#0A0A0A",
  strokeWidth = 2,
}) => {
  const Component = ICON_MAP[(name as CyberIconName)] || Shield;
  return (
    <Component
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    />
  );
};
