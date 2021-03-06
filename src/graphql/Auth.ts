import { objectType, extendType, nonNull, stringArg } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export const AuthPayload = objectType({
    name: 'AuthPayload',
    definition(t) {
        t.nonNull.string('token');
        t.nonNull.field('user', {
            type: 'User'
        });
    }
});

export const AuthMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('login', {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            async resolve(parent, args, context) {
                const user = await context.prisma.user.findUnique({
                    where: { email: args.email }
                });

                if (!user) {
                    throw new Error('No such user found');
                }

                const valid = await bcrypt.compare(args.password, user.password);

                if (!valid) {
                    throw new Error('Invalid password');
                }

                const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET as string);

                return {
                    token,
                    user
                };
            }
        });
        t.nonNull.field('signup', {
            type: 'AuthPayload',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                firstName: nonNull(stringArg()),
                lastName: nonNull(stringArg())
            },
            async resolve(parent, args, context) {
                const { email, firstName, lastName } = args;

                const password = await bcrypt.hash(args.password, 10);

                const user = await context.prisma.user.create({
                    data: { email, firstName, lastName, password }
                });

                const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET as string);

                return {
                    token,
                    user
                };
            }
        });
    }
});
