import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'

export function middleware(request: NextRequest) {
    // const isAuthenticated = request.cookies.get('is_authenticated')?.value === 'true';
    // const access_token = request.cookies.get('access_token')?.value;
    //
    // // Redirect unauthenticated users to login page
    // if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/token')) {
    //     return NextResponse.redirect(new URL('/token', request.url));
    // }
    //
    // // Allow access to other URLs for authenticated users
    // let response = NextResponse.next();
    // response.cookies.set('access_token', String(access_token));
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}

