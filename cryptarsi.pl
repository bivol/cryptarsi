#!/usr/bin/perl
# Version 1.0
# Copyright (c) 2011-2012, Delian Delchev & Atanas Tchobanov
# All rights reserved.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
# 
#     * Redistributions of source code must retain the above copyright
#       notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#     * Neither the name of Delian Delchev & Atanas Tchobanov nor the
#       names of its contributors may be used to endorse or promote products
#       derived from this software without specific prior written permission.
# 
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY
# DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
# ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
# 
# How to use this software
#
# Data is stored in raw text files utf8 encoded. Records are separated by this line: =======================DATA ENDS============================
# Attachments to each record should be placed in a directory named after the refid field. In the following example the name of the directory is BL000. You can use JPG, PNG, MP3, OGG and PDF attachments.
# Example Data structure
#
# id: 1
# date: 29.11.2011
# refid: BL000
# origin: Bulgaria Sofia
# classification: PUBLIC
# destination: 
# tags: Encryption Search Balkanleaks Wikileaks
# subject: Encrypted Data Search Engine
# body: Wondering how this system works? Click on the slides.
# =======================DATA ENDS============================
# 
# Usage: perl mihalya.pl "user" "pass" inputdir outputdir


package aes;
use Crypt::OpenSSL::AES;


sub mycipher {
  my ($data,$key) = @_;
  return new Crypt::OpenSSL::AES($key)->encrypt($data);
}

my $keyend = chr(0) x 32;

sub ctr_encrypt {
  my ($plaintext,$password,$nBits,$mynonce) = @_;
#  my ($plaintext2,$password2,$nBits,$mynonce) = @_;
#  my $plaintext = utf8::encode($plaintext2);
#  my $password = utf8::encode($password2);
  my $blockSize = 16;
  
  if (!($nBits==128 || $nBits==192 || $nBits==256)) { return undef; }
  
  my $nBytes = $nBits/8;
  
  my $key = substr(mycipher(substr($password.$keyend,0,16),substr($password.$keyend,0,$nBytes)) x 2,0,$nBytes);
  
  my $ctrTxt;
  if ($mynonce) {
    $ctrTxt = $mynonce;
  } else {
    $ctrTxt = pack("nnnn",rand(65536),rand(65536),rand(65536),rand(65536));
  }

  my $counterBlock = $ctrTxt;
  my $blockCount = int(0.99999999+length($plaintext)/$blockSize);
  
  my $c = new Crypt::OpenSSL::AES($key);
  for my $b (0..$blockCount-1) {
    substr($counterBlock,8,8,pack("NN",$b/0x100000000,$b));
    my $blockLength = ($b<$blockCount-1)?$blockSize:((length($plaintext)-1)%$blockSize+1);
    $ctrTxt .= substr($c->encrypt($counterBlock) ^ substr($plaintext,$b*$blockSize,$blockLength),0,$blockLength);
  }
  
  return $ctrTxt;  
}

sub ctr_decrypt {
  my ($ciphertext, $password, $nBits) = @_;
  my $blockSize = 16;
  
  if (!($nBits==128 || $nBits==192 || $nBits==256)) { return undef; }
  
  my $nBytes = $nBits/8;

  my $key = substr(mycipher(substr($password.$keyend,0,16),substr($password.$keyend,0,$nBytes)) x 2,0,$nBytes);
  
  my $ctrTxt = substr($ciphertext,0,8,"");
  my $plaintxt = "";
  my $c = new Crypt::OpenSSL::AES($key);
  my $counterBlock = $ctrTxt;
  my $blockCount = int(0.99999999+length($ciphertext)/$blockSize);
  
  for my $b (0..$blockCount-1) {
    substr($counterBlock,8,8,pack("NN",$b/0x100000000,$b));
    my $blockLength = ($b<$blockCount-1)?$blockSize:((length($ciphertext)-1)%$blockSize+1);
    $plaintxt .= substr($c->encrypt($counterBlock) ^ substr($ciphertext,$b*$blockSize,$blockLength),0,$blockLength);
  }
  
  return $plaintext;
}

1;

package main;

use MIME::Base64;


print "Please, enter the login: ";
my $login = <STDIN>; # I moved chomp to a new line to make it more readable
chomp $login; # Get rid of newline character at the end
exit 0 if ($login eq ""); # If empty string, exit.

print "Please, enter the password: ";
my $password = <STDIN>; # I moved chomp to a new line to make it more readable
chomp $password; # Get rid of newline character at the end
exit 0 if ($password eq ""); # If empty string, exit.

print "Please, enter the source dir: ";
my $sourcedir = <STDIN>; # I moved chomp to a new line to make it more readable
chomp $sourcedir; # Get rid of newline character at the end
exit 0 if ($sourcedir eq ""); # If empty string, exit.

print "Please, enter the output dir: ";
my $outputdir = <STDIN>; # I moved chomp to a new line to make it more readable
chomp $outputdir; # Get rid of newline character at the end
exit 0 if ($outputdir eq ""); # If empty string, exit.

my $cdata;
my $g;
my $name = $login;
my $key = $password;
my $outf = $outputdir||"data";
my $key2 = substr($key.$name,0,32);
my $nonce = chr(rand(255)).chr(rand(255)).chr(rand(255)).chr(rand(255)).chr(rand(255)).chr(rand(255)).chr(rand(255)).chr(rand(255));

initdata($sourcedir||".");

encryptdata($cdata);

my $bname = encode_base64($name); $bname =~ s/\n//g;
my $bvalue = encode_base64(aes::ctr_encrypt($name,$key,256,$nonce)); $bvalue =~ s/\n//g;
push(@{$cdata->{data}}, {
  key => $bname,
  value => $bvalue
});

use File::Path qw(mkpath);
mkpath($outputdir."/js",1,0755);
mkpath($outputdir."/css",1,0755);
mkpath($outputdir."/fonts",1,0755);
mkpath($outputdir."/images",1,0755);
mkpath($outputdir."/locale",1,0755);
use File::Copy::Recursive qw(fcopy rcopy dircopy fmove rmove dirmove);
fcopy("index.html",$outputdir) or die $!;
dircopy("js",$outputdir."/js") or die $!;
dircopy("css",$outputdir."/css") or die $!;
dircopy("images",$outputdir."/images") or die $!;
dircopy("fonts",$outputdir."/fonts") or die $!;
dircopy("fonts",$outputdir."/locale") or die $!;
xmlout();

sub xmlout {
printf "Dump the data in separate files\n";
use File::Path qw(mkpath);
$outdir="";
 for my $k (sort { rand(30)-15 } @{$cdata->{data}}) {
  my $outdir=substr unpack("H*",$k->{key}),-3,3;
  mkpath($outputdir."/index/".$outdir,1,0755);
  my $fnm = "./".$outputdir."/index/".$outdir."/file".unpack("H*",$k->{key}).".txt";
  open(F,">".$fnm);
  printf F "%s",$k->{value};
  close(F);
 }
 close(F);
}

sub encryptdata {
  my ($d) = @_;
  
  printf "Encrypting Search Hash";
  $|=1; my $cnt = $#{$d->{data}}+1;
  my $cnt = 0;
  my $len = 1+$#{$d->{data}};
  my $pnt = int($len/100);
  for my $x (@{$d->{data}}) {
    $x->{key} = encode_base64(aes::ctr_encrypt($x->{key},$key2,256,$nonce));
    $x->{key} =~ s/\n//g;
    $x->{value} = encode_base64(aes::ctr_encrypt($x->{value},$key2,256));
    $x->{value} =~ s/\n//g;
    $cnt++;
    if ($cnt%$pnt==0) {
      if ($cnt%($pnt*10)) {
        printf ".";
      } else {
        printf "%d%%",int(100*$cnt/$len+0.5);
      }
    }
  }
  printf "\nDone.\n";
}

sub initdata {
 my ($dir)=@_;
 
 printf "Initialize the data\n";

 opendir(D,$dir) or return;
my $fileid=int(1);
 for my $file (grep { /\.txt$/i } readdir(D)) {
  dumpcable($file,$dir,$fileid);
  $fileid++;
 }
 closedir(D);
 
 map { 
  push(@{$cdata->{data}},
   { key => $_.".count", value => $g->{$_} },
   { key => $_.".idx", value => join(",", sort { $a <=> $b } keys %{$gid->{$_}}) }
  )
 } keys %$g;

 delete $allid{""};
 
 push(@{$cdata->{data}},
   { key => ".count", value => 1+$#{[keys %allid]} },
   { key => ".idx", value => join(",", sort { $a <=> $b } keys %allid) }
 );
 
# printf "words: %s\n",join(",",map { $_."=".$g->{$_} } sort { $g->{$b} <=> $g->{$a} } keys %$g);
# printf "word map: %s\n",join("\n", map { $_."=".join(",",sort { $a <=> $b } keys %{$gid->{$_}}) } keys %$gid);

}

sub ss {
 my ($s) = @_;
 my $r = 128;
 
 return (" " x int(rand($r))).$s.(" " x int(rand($r))); 
}

sub dumpcable {
  my ($file,$dir,$fileid) = @_;
#  print $fileid." : ".$dir."/".$file."\n";
  return unless -f $dir."/".$file;

#  printf "Opening file $file\n";
  
  undef $/;
  
  open(F,$dir."/".$file);$data=<F>;close(F);
  
  my $d;
  
  my $docid=1;
  
  for $d (split(/=======================DATA ENDS============================/i,$data)) {
  
  if($fileid==1) { 
  	$id=1; #must always have id=1
  } else {
  	$id=$fileid."-".$docid; #if many docs in one file
  }
  
   $d =~ s/[^\x20-\xF7,\n\r]/./g; # Remove incorrect characters
   $d =~ s/\r\n/\n/g; $date=$subj=$tags=$refid=$origin=$class=$dest=$header=$attachdata=$attachname=$attachcount=$body= "";
# Default values 

  $subj=$file;
  $date="Not set";
  $tags="No tags";
  $body=$d;
  
   $d=~m/^id:\s+?(\d+)/mi and $id=$1; #override the ID if it's explicit
   $d=~m/^refid:\s+?(\d+)/mi and $id=$1;
   $d=~m/^date:\s+?(.+?)?$/mi and $date=$1;
#   $d=~m/^subject:\s+?(.+?)\n\s+?\n?/ims and $subj=$1;
   $d=~m/^subject:\s+?(.+?)?$/mi and $subj=$1;
   $d=~m/^tags:\s+?(.+?)?$/mi and $tags=$1;
   $d=~m/^refid:\s+?(.+?)?$/mi and $refid=$1;
   $d=~m/^origin:\s+?(.+?)?$/mi and $origin=$1;
   $d=~m/^classification:\s+?(.+?)?$/mi and $class=$1;
   $d=~m/^destination:\s+?(.+?)?$/mi and $dest=$1;
   $d=~m/^body:\s+?(.+?)\n\s+?\n?/ims and $body=$1;
#	$d=~m/^body:\s+?(.+?)?$/mis and $body=$1;
#   print $subj." ".$body."\n";
#	printf "ID:%s DATE:%s REFID:%s ORIGIN:%s CLASS:%s DEST:%s SUBJ:%s HEADER:%s\n",$id,$date,$refid,$origin,$class,$dest,$subj,$header;
   $allid{$id}=1;	
   push(@{$cdata->{data}},
    { key => $id.".data", value => ss($d) },
    { key => $id.".date", value => ss($date) },
    { key => $id.".subj", value => ss($subj) },
    { key => $id.".tags", value => ss($tags) },
    { key => $id.".refid", value => ss($refid) },
    { key => $id.".class", value => ss($class) },
    { key => $id.".origin", value => ss($origin) },
    { key => $id.".dest", value => ss($dest) },
    { key => $id.".body", value => ss($body) }
     ) if $id;

	# open images directory and add images
	if($refid eq ""){
		$attchdir=$sourcedir;
	} else {
		$attchdir=$sourcedir."/".$refid;
	}
     opendir(D,$attchdir);
     	$in=1;
 		for my $attachfile (sort grep { /(\.png)|(\.jpg)|(\.mp3)|(\.ogg)|(\.pdf)$/i } readdir(D)) {
 			$ext = ($attachfile =~ m/([^.]+)$/)[0];
 			open(F,$attchdir."/".$attachfile);
 			$attachdata=<F>;
 			close(F);
 			 push(@{$cdata->{data}},
 		 	 {key => $id.".attachtype.".$in, value => ss($ext)},
 		 	 {key => $id.".attachname.".$in, value => ss($attachfile)},
 			 {key => $id.".attachdata.".$in, value => ss(encode_base64($attachdata))}
 			 );
 			$in++;
 		}
 		
 		push(@{$cdata->{data}},
 		 	 {key => $id.".attachcount",value => $in}
 			 ) if $id;
	 closedir(D);	 
	 words($id,$d); # ???
	 $docid++;
	 print "Processing ID: ".$id."\n";
  }
  
}

sub words {
 my ($id,$s) = @_;
 
 use utf8;
 utf8::upgrade($s);
 utf8::decode($s);
 $s=lc($s);
 utf8::encode($s);
 utf8::downgrade($s);
 no utf8;
 
 my $h={};
 
 #$s=~s/\W?(\w{2,15})/$h->{$1}=1/gei;
 $s=~ s/((\w|[\x80-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}){2,15})/$h->{$1}=1/gei;
 
 #printf "words: %s\n",join(",",map { $_."=".$h->{$_} } sort { $h->{$b} <=> $h->{$a} } keys %$h);
 
 map { $g->{$_} += $h->{$_}, $gid->{$_}->{$id}=1 } keys %$h;
}

1;