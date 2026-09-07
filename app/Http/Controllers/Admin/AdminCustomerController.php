<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrintSession;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCustomerController extends Controller
{
    /**
     * Display Customers & Registered Users with their order history.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');

        $customers = User::with(['roles'])
            ->select('users.*')
            ->selectSub(function ($query) {
                $query->selectRaw('coalesce(count(print_jobs.id), 0)')
                    ->from('print_jobs')
                    ->join('print_sessions', 'print_sessions.id', '=', 'print_jobs.print_session_id')
                    ->join('qr_prints', 'qr_prints.id', '=', 'print_sessions.qr_print_id')
                    ->whereColumn('qr_prints.user_id', 'users.id');
            }, 'print_jobs_count')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total_users' => User::count(),
            'total_print_sessions' => PrintSession::count(),
            'paid_sessions' => PrintSession::where('payment_status', 'paid')->count(),
        ];

        return Inertia::render('admin/customers/index', [
            'customers' => $customers->through(fn(User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                'print_jobs_count' => $user->print_jobs_count,
                'email_verified' => !is_null($user->email_verified_at),
                'created_at' => $user->created_at?->toDateTimeString(),
            ]),
            'filters' => [
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }
}
