import crypto from 'crypto';
import User from '../../../../models/user.model.js';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const attempt = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return attempt === hash;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
}

export interface LoginPayload {
  correo: string;
  password: string;
}

class AuthService {
  async register(payload: RegisterPayload) {
    const { nombre, apellido, correo, password } = payload;

    if (!nombre || !apellido || !correo || !password) {
      throw new Error('Todos los campos son obligatorios');
    }

    const existing = await User.findOne({ where: { correo } });
    if (existing) {
      throw new Error('Ya existe una cuenta con ese correo');
    }

    const password_hash = hashPassword(password);
    const user = await User.create({ nombre, apellido, correo, password_hash });

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
    };
  }

  async login(payload: LoginPayload) {
    const { correo, password } = payload;

    if (!correo || !password) {
      throw new Error('Correo y contraseña son obligatorios');
    }

    const user = await User.findOne({ where: { correo } });
    if (!user) {
      throw new Error('Correo o contraseña incorrectos');
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      throw new Error('Correo o contraseña incorrectos');
    }

    return {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
    };
  }
}

export const authService = new AuthService();