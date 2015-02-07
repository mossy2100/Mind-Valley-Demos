<?php
/**
 * @file
 * Class file for the ShortUrl class, which maps to the short_url DB table.
 */

class ShortUrl {

  /**
   * Constant to define valid characters (digits) in a shortened URL code.
   * Using my triacontakaidecimal (base-32) number system (no TOIL).
   * Like other URL-shortening services, a base-62 system could be used that
   * would include all upper- and lower-case letters, but MySQL is
   * case-insensitive out of the box, so this will do for now. At least with
   * this system the digits are more likely to be transposed correctly if
   * written.
   *
   * @var string
   */
  const BASE32_DIGITS = '0123456789ABCDEFGHJKMNPQRSUVWXYZ';

  /**
   * The primary key of the DB record.
   * @var int
   */
  protected $id;

  /**
   * The URL.
   * @var string
   */
  protected $url;

  /**
   * The unique base-32 code.
   * @var string
   */
  protected $code;

  //////////////////////////////////////////////////////////////////////////////
  // Static methods.

  /**
   * Lookup a ShortUrl given a code.
   *
   * @param string $code
   *   The base-32 code.
   *
   * @return self
   *   Or FALSE if not found.
   */
  public static function lookupByCode($code) {
    $rec = db_select('short_url', 'u')
      ->fields('u')
      ->condition('code', $code)
      ->execute()
      ->fetchObject();
    return empty($rec) ? FALSE : new self($rec);
  }

  /**
   * Lookup a ShortUrl given the original long URL.
   *
   * @param string $url
   *   The original URL.
   *
   * @return self
   *   Or FALSE if not found.
   */
  public static function lookupByUrl($url) {
    $rec = db_select('short_url', 'u')
      ->fields('u')
      ->condition('url', $url)
      ->execute()
      ->fetchObject();
    return empty($rec) ? FALSE : new self($rec);
  }

  /**
   * Get/set the last code created.
   *
   * @return string
   *   The last code as a base-32 string.
   */
  public static function lastCode() {
    return db_select('short_url', 'u')
      ->fields('u', array('code'))
      ->orderBy('id', 'desc')
      ->range(0, 1)
      ->execute()
      ->fetchField();
  }

  /**
   * Increments the provided code.
   *
   * @param string $code
   *   The base-32 code.
   *
   * @return string
   *   The code incremented by 1.
   */
  public static function incCode($code) {
    // Can't use [] character indexing with constants, so, instead of using
    // substr(), copy to a string var (mainly for convenience).
    $base32_digits = self::BASE32_DIGITS;

    // Get the last/max digit. This approach permits changes to charset.
    $last_digit = $base32_digits[strlen($base32_digits) - 1];

    // Find index of digit in $code to increment.
    $found = FALSE;
    $code_len = strlen($code);
    $n = $code_len - 1;
    while ($n >= 0) {
      $ch = $code[$n];
      if ($ch != $last_digit) {
        $found = TRUE;
        break;
      }
      $n--;
    }

    if ($found) {
      // Get the integer value of the character at position $n.
      $x = strpos($base32_digits, $ch);

      // Get next digit.
      $ch2 = $base32_digits[$x + 1];

      // Assemble new code.
      $new_code = substr($code, 0, $n) . $ch2 . str_repeat('0', $code_len - $n - 1);
    }
    else {
      // Increase code length by 1.
      $new_code = '1' . str_repeat('0', $code_len);
    }

    return $new_code;
  }

  /**
   * Get the next code.
   *
   * @return string
   *   The next code as a base-32 string.
   */
  public static function nextCode() {
    $last_code = self::lastCode();

    // Get the next code.
    if (!$last_code) {
      // First one! Should only happen once.
      $next_code = '1';
    }
    else {
      // Add 1 to last code.
      $next_code = self::incCode($last_code);
    }

    return $next_code;
  }

  //////////////////////////////////////////////////////////////////////////////
  // Instance methods.

  /**
   * Construct a new ShortUrl.
   *
   * @param mixed $param
   *   Can be a string (the long URL) or a DB record to copy.
   *
   * @throws Exception
   */
  public function __construct($param) {
    if (is_string($param)) {
      $this->url = $param;
    }
    else if (is_object($param)) {
      // Copy the property values.
      foreach ($param as $prop => $value) {
        $this->{$prop} = $value;
      }
    }
    else {
      throw new Exception("Invalid parameter.");
    }
  }

  /**
   * Save a new ShortUrl to the DB. Update or insert as required.
   *
   * @return self
   *   For method chaining.
   */
  public function save() {
    // If the code isn't set, use the next one.
    if (!$this->code) {
      $this->code = self::nextCode();
    }

    db_merge('short_url')
      ->key(array('id' => $this->id))
      ->fields(array(
        'code' => $this->code,
        'url' => $this->url,
      ))
      ->execute();

    return $this;
  }

  /**
   * Get/set the URL.
   * 
   * @param string $new_url
   *   Omit for get mode.
   *
   * @return self
   *   Or a string in get mode.
   */
  public function url($new_url = NULL) {
    if (isset($new_url)) {
      // Set the URL.
      $this->url = $new_url;
      // Return this so we can chain methods.
      return $this;
    }
    else {
      // Get the URL.
      return $this->url;
    }
  } 
  
  /**
   * Get/set the code.
   * 
   * @param string $new_code
   *   Omit for get mode.
   *
   * @return self
   *   Or a string in get mode.
   */
  public function code($new_code = NULL) {
    if (isset($new_code)) {
      // Set the code.
      $this->code = $new_code;
      // Return this so we can chain methods.
      return $this;
    }
    else {
      // Get the code.
      return $this->code;
    }
  }

}
