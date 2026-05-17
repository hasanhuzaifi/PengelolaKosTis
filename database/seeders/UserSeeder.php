<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Hasan Huzaifi',
            'email'    => 'admin@alfirdaus.com',
            'password' => Hash::make('password123'),
            'role'     => 'admin',
        ]);
    }
}
