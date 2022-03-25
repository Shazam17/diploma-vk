import { Injectable } from '@nestjs/common';
import { User } from '../entities/User.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

const easyvk = require('easyvk');

const lpSettings = {
  forGetLongPollServer: {
    lp_version: 3, // Изменяем версию LongPoll, в EasyVK используется версия 2
    need_pts: 1,
  },
  forLongPollServer: {
    wait: 15, // Ждем ответа 15 секунд
    mode: 2
  },
};

const path = require('path');
const sessionPath = path.join(__dirname, '.current-session');

@Injectable()
export class AppService {
  private tempLogins: Map<any, any>;
  private clients: Map<any, any>;

  constructor(
    private sequelize: Sequelize,
    @InjectModel(User)
    private userModel: typeof User,
  ) {
    this.tempLogins = new Map();
    this.clients = new Map();
    this.recoverSessions();
  }

  saveInstance(vk) {
    const { session } = vk;
    this.userModel
      .create({
        name: session.username,
        token: session.access_token,
        status: 'working',
      })
      .catch(console.log);
  }

  instanceInit(vk) {
    const { session } = vk;
    this.clients.set(session.username, vk);

    vk.longpoll.connect(lpSettings).then((lpcon: any) => {
      lpcon.on('message', (message) => {
        console.log(message);
        const [
          messageType,
          messageId,
          flag,
          peerId,
          dateTime,
          messageText,
          from,
        ] = message;

        console.log(messageId);
        console.log(peerId);
        console.log(new Date(dateTime * 1000));
        console.log(messageText);
        console.log(from);
        if (from.attach1_type) {

        }
      });
      lpcon
        .on('error', console.error)
        .on('failure', console.error)
        .on('reconnectError', console.error);
    });
  }

  async login(params) {
    return new Promise((resolve) => {
      const relogIn = (_2faCode = '') => {
        if (_2faCode) params.code = _2faCode;

        easyvk({
          ...params,
          utils: {
            uploader: true,
          },
        })
          .then((vk) => {
            this.saveInstance(vk);
            this.instanceInit(vk);
            resolve({ err: null, success: true });
          })
          .catch((err) => {
            if (!err.easyvk_error) {
              console.log(err);
              if (err.error_code == 'need_validation') {
                this.tempLogins.set(params.username, params);
              }
              if (err.error_code === '') {
              }
              resolve({ error: err.error_code });
            }
          });
      };

      relogIn();
    });
  }

  async loginBySession(user: User) {
    const { token, name } = user;
    console.log(`logging session by token with name: ${name}`);
    easyvk({
      utils: {
        uploader: true,
        longpoll: true
      },
      token,
    }).then((vk) => {
      this.instanceInit(vk);
    });
  }

  async recoverSessions() {
    const allUsers = await this.userModel.findAll().catch(console.log);
    (allUsers || []).map((item: User) => {
      this.loginBySession(item);
    });
    return { success: true };
  }

  async getHello(params): Promise<any> {
    const { username } = params;
    const lastLoginParams = this.tempLogins.get(username);
    const newLoginParams = { ...lastLoginParams, ...params };
    return this.login(newLoginParams);
  }
}
