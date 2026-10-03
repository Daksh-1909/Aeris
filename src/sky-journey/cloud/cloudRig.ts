export const cloudShapeNames = ['cumulus', 'stratus', 'tower', 'comet'] as const;
export type CloudShapeName = (typeof cloudShapeNames)[number];

export const cloudExpressionNames = ['calm', 'wide', 'proud', 'awake', 'happy', 'laugh', 'sleep', 'blink'] as const;
export type CloudExpressionName = (typeof cloudExpressionNames)[number];

export interface CloudRigShape {
  label: string;
  checkpoint: number;
  circles: Array<[number, number, number]>;
  base: [number, number, number, number, number];
  face: Record<string, number>;
}

export interface CloudExpression {
  eyeScaleY: number;
  eyeRK?: number;
  mouthCurve?: number;
  mouthWidthK?: number;
  stroke?: number;
  tears?: number;
  keepMouth?: boolean;
}

export interface CloudRigCheckpoint {
  id: number;
  shape: CloudShapeName;
  expression: CloudExpressionName;
  content: 'sky' | 'nature' | 'numbers' | 'contact';
}

export interface CloudRigActivity {
  from: 'start' | 1 | 2 | 3;
  to: 1 | 2 | 3 | 4;
  name: 'blink' | 'happy' | 'laugh' | 'sleep';
  loops?: number;
  tears?: number;
  zzz?: number;
}

export interface CloudRigPath {
  viewBox: [number, number];
  points: Array<[number, number]>;
  d: string;
  checkpointFractions: [number, number, number, number];
  approxLength: number;
}

export interface CloudRig {
  version: 1;
  viewBox: [number, number];
  note: string;
  shapes: Record<CloudShapeName, CloudRigShape>;
  expressions: Record<CloudExpressionName, CloudExpression>;
  checkpoints: [CloudRigCheckpoint, CloudRigCheckpoint, CloudRigCheckpoint, CloudRigCheckpoint];
  activities: [CloudRigActivity, CloudRigActivity, CloudRigActivity, CloudRigActivity];
  paths: { desktop: CloudRigPath; mobile: CloudRigPath };
}

const rigUrl = '/3d/cloud-character/cloud-rig.json';

function fail(message: string): never {
  throw new Error(`Invalid cloud rig: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`${label} must be an object`);
  return value;
}

function requireString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.length === 0) fail(`${label} must be a non-empty string`);
}

function requireFinite(value: unknown, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(`${label} must be a finite number`);
}

function requireTuple(value: unknown, length: number, label: string): asserts value is number[] {
  if (!Array.isArray(value) || value.length !== length) fail(`${label} must contain ${length} numbers`);
  value.forEach((item, index) => requireFinite(item, `${label}[${index}]`));
}

function sameKeys(value: Record<string, unknown>, expected: string[], label: string) {
  const keys = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (keys.length !== sortedExpected.length || keys.some((key, index) => key !== sortedExpected[index])) {
    fail(`${label} keys must be ${sortedExpected.join(', ')}`);
  }
}

function requireName<T extends readonly string[]>(value: unknown, names: T, label: string): asserts value is T[number] {
  if (typeof value !== 'string' || !names.includes(value)) fail(`${label} has an unknown value`);
}

function validatePath(value: unknown, label: string): CloudRigPath {
  const path = requireRecord(value, label);
  requireTuple(path.viewBox, 2, `${label}.viewBox`);
  if (!Array.isArray(path.points) || path.points.length < 2) fail(`${label}.points must contain at least two points`);
  path.points.forEach((point, index) => requireTuple(point, 2, `${label}.points[${index}]`));
  requireString(path.d, `${label}.d`);
  if (!Array.isArray(path.checkpointFractions) || path.checkpointFractions.length !== 4) fail(`${label}.checkpointFractions must contain four fractions`);
  path.checkpointFractions.forEach((fraction, index) => requireFinite(fraction, `${label}.checkpointFractions[${index}]`));
  requireFinite(path.approxLength, `${label}.approxLength`);
  return path as unknown as CloudRigPath;
}

/** Validate the downloaded JSON before exposing it to rendering code. */
export function parseCloudRig(value: unknown): CloudRig {
  const rig = requireRecord(value, 'root');
  if (rig.version !== 1) fail('version must be 1');
  requireTuple(rig.viewBox, 2, 'viewBox');
  requireString(rig.note, 'note');

  const shapes = requireRecord(rig.shapes, 'shapes');
  sameKeys(shapes, [...cloudShapeNames], 'shapes');
  let referenceShapeKeys: string[] | undefined;
  let referenceFaceKeys: string[] | undefined;
  for (const name of cloudShapeNames) {
    const shape = requireRecord(shapes[name], `shapes.${name}`);
    const shapeKeys = Object.keys(shape).sort();
    if (referenceShapeKeys && shapeKeys.join('|') !== referenceShapeKeys.join('|')) fail(`shapes.${name} has different keys from the other shapes`);
    referenceShapeKeys ??= shapeKeys;
    requireString(shape.label, `shapes.${name}.label`);
    requireFinite(shape.checkpoint, `shapes.${name}.checkpoint`);
    if (!Array.isArray(shape.circles) || shape.circles.length !== 7) fail(`shapes.${name} must have exactly 7 circles`);
    shape.circles.forEach((circle, index) => requireTuple(circle, 3, `shapes.${name}.circles[${index}]`));
    requireTuple(shape.base, 5, `shapes.${name}.base`);
    const face = requireRecord(shape.face, `shapes.${name}.face`);
    const faceKeys = Object.keys(face).sort();
    if (referenceFaceKeys && faceKeys.join('|') !== referenceFaceKeys.join('|')) fail(`shapes.${name}.face has different keys from the other shapes`);
    referenceFaceKeys ??= faceKeys;
    Object.entries(face).forEach(([key, number]) => requireFinite(number, `shapes.${name}.face.${key}`));
  }

  const expressions = requireRecord(rig.expressions, 'expressions');
  sameKeys(expressions, [...cloudExpressionNames], 'expressions');
  for (const name of cloudExpressionNames) {
    const expression = requireRecord(expressions[name], `expressions.${name}`);
    requireFinite(expression.eyeScaleY, `expressions.${name}.eyeScaleY`);
    for (const key of ['eyeRK', 'mouthCurve', 'mouthWidthK', 'stroke', 'tears']) {
      if (key in expression) requireFinite(expression[key], `expressions.${name}.${key}`);
    }
    if ('keepMouth' in expression && typeof expression.keepMouth !== 'boolean') fail(`expressions.${name}.keepMouth must be boolean`);
  }

  if (!Array.isArray(rig.checkpoints) || rig.checkpoints.length !== 4) fail('checkpoints must contain four entries');
  rig.checkpoints.forEach((value, index) => {
    const checkpoint = requireRecord(value, `checkpoints[${index}]`);
    if (checkpoint.id !== index + 1) fail(`checkpoints[${index}].id must be ${index + 1}`);
    requireName(checkpoint.shape, cloudShapeNames, `checkpoints[${index}].shape`);
    requireName(checkpoint.expression, cloudExpressionNames, `checkpoints[${index}].expression`);
    requireName(checkpoint.content, ['sky', 'nature', 'numbers', 'contact'] as const, `checkpoints[${index}].content`);
  });

  if (!Array.isArray(rig.activities) || rig.activities.length !== 4) fail('activities must contain four entries');
  rig.activities.forEach((value, index) => {
    const activity = requireRecord(value, `activities[${index}]`);
    const expectedFrom = index === 0 ? 'start' : index;
    if (activity.from !== expectedFrom) fail(`activities[${index}].from is out of sequence`);
    if (activity.to !== index + 1) fail(`activities[${index}].to is out of sequence`);
    requireName(activity.name, ['blink', 'happy', 'laugh', 'sleep'] as const, `activities[${index}].name`);
    for (const key of ['loops', 'tears', 'zzz']) {
      if (key in activity) requireFinite(activity[key], `activities[${index}].${key}`);
    }
  });

  const paths = requireRecord(rig.paths, 'paths');
  const parsedPaths = {
    desktop: validatePath(paths.desktop, 'paths.desktop'),
    mobile: validatePath(paths.mobile, 'paths.mobile'),
  };

  return { ...rig, shapes: shapes as unknown as CloudRig['shapes'], expressions: expressions as unknown as CloudRig['expressions'], paths: parsedPaths } as CloudRig;
}

export async function loadCloudRig(fetcher: typeof fetch = fetch): Promise<CloudRig> {
  const response = await fetcher(rigUrl);
  if (!response.ok) throw new Error(`Unable to load cloud rig (${response.status})`);
  return parseCloudRig(await response.json());
}
