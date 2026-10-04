
import { Entity, PrimaryColumn, Column , CreateDateColumn,UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export  enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}


@Entity({ name: 'TABLE_PASS' })
export class User {

  @PrimaryGeneratedColumn()
  ID!: number;

  @Column({ name: 'LISTUSER', type: 'varchar', length: 50 , unique: true, })
  username!: string;

  @Column({ name: 'LISTPASS', type: 'varchar', length: 255 })
  password!: string;

  @Column({
    name: 'ROLE',
    type: 'varchar',
    length: 30,
    default: UserRole.ADMIN,
  })
  role!: UserRole;

  @Column({
    name: 'IS_ACTIVE',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'CREATED_AT',
    type: 'datetime',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'UPDATED_AT',
    type: 'datetime',
  })
  updatedAt!: Date;
}